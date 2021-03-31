function union(sets){ // Just simply adds iteratively
    let u = new Set
    $.each(sets, function(i, set){
	u = new Set([...u, ...set]); 
    });
    return u;
}
function intersection(sets){ // uses the spread operator (...), iteratively
    let inter = false;
    $.each(sets, function(k,v){
	if(!inter){inter = v}
	inter = new Set([...inter].filter(x => v.has(x)))
    });
    if(!inter){return new Set}
    return inter;
}
class Sets {

    static activeSets = {};
    static tid2loc = {};
    static SuperSet = {}; // SuperSet is a hash of hashes, where the innerhashes are key/set pairs. The sets are simply tids, on which set operations can be performed.

    static initSuperSet(meta){
	let column_names = {};
	for (const [k, v] of Object.entries(meta[0])) {
	    if(v != "tid"){
		column_names[k] = v;
		this.SuperSet[v] = {};
	    }
	}
	for (const [k, v] of Object.entries(meta.slice(1,meta.length))) {
	    let tid = v[0];
	    for (const [i, e] of Object.entries(v)){
		if(e !== null & i != 0 & e != 0){ 
		    let key = column_names[i];
		    if(key == "place"){this.tid2loc[tid] = e}
		    if(!(e in this.SuperSet[key])){
			this.SuperSet[key][e] = new Set;
		    }
		    this.SuperSet[key][e].add(tid);
		}
		else{
//		    if(i != 0){console.log(column_names[i],e)}
		}
	    }
	}
    }
    // updates the k values in activeSets {sex: {…}, agegroup: {…}, age: {…}}, in the range l - r, but checks each value is actually present in SuperSet
    static interval_add_set(k,l,r){
	this.activeSets[k] = {} // IE, this is going to be reset, so needs to be purged
	var i;
	for(i = l; i <= r; i++){
	    if(i in this.SuperSet[k]){
		this.add_set(k,i);
	    }
	}
	return true;
    }

    static add_set(k,v){
	if(!(k in this.activeSets)){this.activeSets[k] = {}}
	this.activeSets[k][v] = true;
    }

    static rem_set(k,e){
	if(!this.activeSets){return false;} // THIS SHOULDN'T OCCUR
	delete this.activeSets[k][e];
	if(Object.keys(this.activeSets[k]).length == 0){
	    // the following was commented out to facilitate …
	    //	  delete this.activeSets[k]; // otherwise, we'll end up calculating the intersection of this empty set with another
	}
    }

    static select_tids(){ // IMPORTANT! WITHIN SAME CAT, UNION; BETWEEN, INTERSECTION
	let sets = [];
	for (const [k, v] of Object.entries(this.activeSets)){
	    let set = [];
	    let keys = Object.keys(v);
	    for (const [i, w] of Object.entries(keys)){
		set.push(this.SuperSet[k][w]);
	    }
	    set = union(set); // NB!! Could be empty set!
	    sets.push(set);
	}
	return intersection(sets); // AGAIN!! Could be empty set!
    }

    static remove_active_set(k){
	delete this.activeSets[k];
    }
    
}
